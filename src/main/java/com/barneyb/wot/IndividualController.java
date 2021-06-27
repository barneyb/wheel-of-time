package com.barneyb.wot;

import com.barneyb.wot.model.Individual;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.QueryValue;
import lombok.val;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionFactory;
import org.apache.jena.system.Txn;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Controller("/individual")
public class IndividualController {

    @Get
    public List<?> index(
            @QueryValue("q") String query,
            @QueryValue(defaultValue = "1") int page
    ) {
        Dataset dataset = DatasetFactory.createTxnMem();
        val result = new ArrayList<>();
        try (RDFConnection conn = RDFConnectionFactory.connect(dataset)) {
            Txn.executeWrite(conn, () -> {
                conn.load("/home/barneyb/Documents/wot/ontology.ttl");
                conn.querySelect("prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> " +
                        "SELECT DISTINCT ?s ?label { " +
                        "?s ?p ?o. " +
                        "OPTIONAL { ?s rdfs:label ?label} " +
                        "} " +
                        "ORDER BY ?s " +
                        "LIMIT 20 OFFSET " + ((page - 1) * 20), (qs) -> {
                    val subject = qs.getResource("s");
                    val l = Optional.ofNullable(qs.getLiteral("label"));
                    result.add(subject.getURI() + " as '" + l.map(Literal::getLexicalForm).orElse("") + "'");
                });
            });
        }
        return result;
    }

    @Get("/{name}")
    Individual get(
            @PathVariable String name
    ) {
        val i = new Individual();
        i.setIri(".../" + name);
        return i;
    }

}
